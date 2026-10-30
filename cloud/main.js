/* Room Stay Cloud Code — deploy to Back4App before tightening CLPs.
 * Never place the Master Key in browser code. All privileged operations live here.
 */
'use strict';

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') { try { var parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch (_) { return []; } }
  return [];
}

async function requireRole(user, roleName) {
  if (!user) throw new Parse.Error(Parse.Error.SESSION_MISSING, 'Please sign in.');
  var roleQuery = new Parse.Query(Parse.Role);
  roleQuery.equalTo('name', roleName);
  var role = await roleQuery.first({ useMasterKey: true });
  if (!role) throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, roleName + ' role is not configured.');
  var members = await role.getUsers().query().find({ useMasterKey: true });
  if (!members.some(function (member) { return member.id === user.id; })) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'You are not authorized to perform this action.');
  }
  return user;
}

function plainProperty(p) {
  var agent = p.get('agent');
  return {
    id: p.id,
    title: p.get('title') || '',
    description: p.get('description') || '',
    suburb: p.get('suburb') || '',
    city: p.get('city') || '',
    address: '', // exact street address is intentionally not public
    type: p.get('type') || 'Room',
    bedrooms: Number(p.get('bedrooms')) || 0,
    bathrooms: Number(p.get('bathrooms')) || 0,
    landlordPrice: 0, // never expose landlord's private price
    publicPrice: Number(p.get('publicPrice')) || 0,
    amenities: parseArray(p.get('amenities')),
    images: parseArray(p.get('images')),
    agentId: agent ? agent.id : null,
    status: p.get('status') || 'pending',
    managed: !!p.get('managed'),
    createdAt: p.createdAt ? p.createdAt.getTime() : Date.now()
  };
}

Parse.Cloud.define('getApprovedProperties', async function () {
  var query = new Parse.Query('Property');
  query.equalTo('status', 'approved');
  query.descending('createdAt');
  query.limit(200);
  var rows = await query.find({ useMasterKey: true });
  return rows.map(plainProperty);
});

Parse.Cloud.define('ensureLandlordRole', async function (request) {
  var user = request.user;
  if (!user) throw new Parse.Error(Parse.Error.SESSION_MISSING, 'Please sign in first.');
  var roleQuery = new Parse.Query(Parse.Role);
  roleQuery.equalTo('name', 'Landlord');
  var role = await roleQuery.first({ useMasterKey: true });
  if (!role) {
    role = new Parse.Role('Landlord', new Parse.ACL());
    await role.save(null, { useMasterKey: true });
  }
  var memberQuery = role.getUsers().query();
  memberQuery.equalTo('objectId', user.id);
  if (!(await memberQuery.first({ useMasterKey: true }))) {
    role.getUsers().add(user);
    await role.save(null, { useMasterKey: true });
  }
  user.set('isAdmin', false);
  user.set('isLandlord', true);
  await user.save(null, { useMasterKey: true });
  return { success: true };
});

Parse.Cloud.define('adminListProperties', async function (request) {
  await requireRole(request.user, 'Admin');
  var query = new Parse.Query('Property');
  query.descending('createdAt');
  query.limit(200);
  return await query.find({ useMasterKey: true });
});

Parse.Cloud.define('adminSetPropertyStatus', async function (request) {
  await requireRole(request.user, 'Admin');
  var id = String(request.params.propertyId || '');
  var status = String(request.params.status || '');
  if (!id || ['approved', 'pending', 'rejected', 'rented'].indexOf(status) < 0) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Invalid property or status.');
  }
  var property = await new Parse.Query('Property').get(id, { useMasterKey: true });
  property.set('status', status);
  if (status === 'approved') {
    var price = Number(request.params.publicPrice);
    if (!Number.isFinite(price) || price <= 0 || price < Number(property.get('landlordPrice') || 0)) {
      throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'Enter a valid public price not below the landlord price.');
    }
    property.set('publicPrice', price);
    property.set('approvedAt', new Date());
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    property.setACL(acl);
  }
  await property.save(null, { useMasterKey: true });
  return { success: true, propertyId: property.id, status: status };
});

Parse.Cloud.define('adminDeleteProperty', async function (request) {
  await requireRole(request.user, 'Admin');
  var id = String(request.params.propertyId || '');
  if (!id) throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Property ID is required.');
  var property = await new Parse.Query('Property').get(id, { useMasterKey: true });
  await property.destroy({ useMasterKey: true });
  return { success: true };
});

Parse.Cloud.define('submitViewingRequest', async function (request) {
  var p = request.params || {};
  var propertyId = String(p.propertyId || '');
  var name = String(p.tenantName || '').trim();
  var phone = String(p.tenantPhone || '').trim();
  var email = String(p.tenantEmail || '').trim();
  var moveInDate = String(p.moveInDate || '');
  if (!propertyId || name.length < 2 || phone.length < 7 || !/^\d{4}-\d{2}-\d{2}$/.test(moveInDate)) {
    throw new Parse.Error(Parse.Error.VALIDATION_ERROR, 'Please provide a valid name, phone number, property and move-in date.');
  }
  var property = await new Parse.Query('Property').get(propertyId, { useMasterKey: true });
  if (property.get('status') !== 'approved') throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'This property is not available for viewing.');
  var Enquiry = Parse.Object.extend('Enquiry');
  var enquiry = new Enquiry();
  enquiry.set('property', property);
  enquiry.set('propertyTitle', property.get('title') || 'Room');
  enquiry.set('tenantName', name);
  enquiry.set('tenantPhone', phone);
  enquiry.set('tenantEmail', email);
  enquiry.set('people', Math.max(1, Math.min(10, Number(p.people) || 1)));
  enquiry.set('employment', String(p.employment || ''));
  enquiry.set('moveInDate', moveInDate);
  enquiry.set('status', 'new');
  var acl = new Parse.ACL();
  acl.setRoleReadAccess('Admin', true);
  var owner = property.get('owner');
  if (owner) acl.setReadAccess(owner.id, true);
  enquiry.setACL(acl);
  await enquiry.save(null, { useMasterKey: true });
  return { success: true, enquiryId: enquiry.id };
});


Parse.Cloud.define('checkUserRole', async function (request) {
  var roleName = String(request.params.roleName || '');
  if (['Admin', 'Landlord'].indexOf(roleName) < 0) throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Invalid role.');
  await requireRole(request.user, roleName);
  return { allowed: true, role: roleName };
});

Parse.Cloud.define('adminListEnquiries', async function (request) {
  await requireRole(request.user, 'Admin');
  var query = new Parse.Query('Enquiry');
  query.descending('createdAt');
  query.limit(200);
  return await query.find({ useMasterKey: true });
});

Parse.Cloud.define('adminListAgents', async function (request) {
  await requireRole(request.user, 'Admin');
  var query = new Parse.Query('Agent');
  query.ascending('name');
  query.limit(200);
  return await query.find({ useMasterKey: true });
});

Parse.Cloud.define('adminAssignAgent', async function (request) {
  await requireRole(request.user, 'Admin');
  var property = await new Parse.Query('Property').get(String(request.params.propertyId || ''), { useMasterKey: true });
  var agentId = String(request.params.agentId || '');
  if (agentId) {
    var agent = await new Parse.Query('Agent').get(agentId, { useMasterKey: true });
    property.set('agent', agent);
  } else property.unset('agent');
  await property.save(null, { useMasterKey: true });
  return { success: true };
});

Parse.Cloud.define('adminUpdateEnquiry', async function (request) {
  await requireRole(request.user, 'Admin');
  var enquiry = await new Parse.Query('Enquiry').get(String(request.params.enquiryId || ''), { useMasterKey: true });
  var status = String(request.params.status || '');
  if (['new', 'contacted', 'closed'].indexOf(status) < 0) throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Invalid enquiry status.');
  enquiry.set('status', status);
  if (status === 'contacted') enquiry.set('contactedAt', new Date());
  await enquiry.save(null, { useMasterKey: true });
  return { success: true };
});


Parse.Cloud.define('getApprovedProperty', async function (request) {
  var id = String(request.params.propertyId || '');
  if (!id) throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Property ID is required.');
  var property = await new Parse.Query('Property').get(id, { useMasterKey: true });
  if (property.get('status') !== 'approved') throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'This room is not available.');
  return plainProperty(property);
});

// Client-created or client-edited properties are always pending and owned by the
// authenticated landlord. Approval and public price changes are Cloud-Code-only.
Parse.Cloud.beforeSave('Property', async function (request) {
  if (request.master) return;
  var user = request.user;
  if (!user) throw new Parse.Error(Parse.Error.SESSION_MISSING, 'Please sign in to manage a listing.');
  var object = request.object;
  if (object.id) {
    var existing = await new Parse.Query('Property').get(object.id, { useMasterKey: true });
    var owner = existing.get('owner');
    if (!owner || owner.id !== user.id) throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'You cannot edit this listing.');
  } else {
    object.set('owner', user);
  }
  object.set('status', 'pending');
  object.unset('publicPrice');
});

// Never allow browser signup/profile updates to grant administrator privileges.
Parse.Cloud.beforeSave(Parse.User, async function (request) {
  if (request.master) return;
  request.object.set('isAdmin', false);
  request.object.set('isLandlord', false);
});
