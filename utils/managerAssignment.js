import Manager from "../models/manager.js";
import AssignmentState from "../models/assignmentState.js";

const STATE_KEY = "managerAssignments";
const NEW_MANAGER_QUOTA = 5;

const getState = async () => {
  return AssignmentState.findOneAndUpdate(
    { key: STATE_KEY },
    { $setOnInsert: { key: STATE_KEY, userIndex: 0, sellerIndex: 0 } },
    { new: true, upsert: true }
  );
};

const pickManagerByQuota = (managers, quotaField) => {
  const pending = managers.filter((m) => (m[quotaField] || 0) > 0);
  if (!pending.length) return null;
  pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return pending[0];
};

const pickManagerRoundRobin = (managers, index) => {
  if (!managers.length) return null;
  const safeIndex = index % managers.length;
  return managers[safeIndex];
};

const assignEntityToManager = async ({ entityId, entityType }) => {
  const managers = await Manager.find({}).sort({ createdAt: 1 });
  if (!managers.length) return null;

  const state = await getState();

  const quotaField = entityType === "user" ? "pendingUserQuota" : "pendingSellerQuota";
  const indexField = entityType === "user" ? "userIndex" : "sellerIndex";

  let manager = pickManagerByQuota(managers, quotaField);

  if (!manager) {
    manager = pickManagerRoundRobin(managers, state[indexField]);
    state[indexField] = (state[indexField] || 0) + 1;
  } else {
    manager[quotaField] = Math.max(0, (manager[quotaField] || 0) - 1);
  }

  if (!manager) return null;

  if (entityType === "user") {
    await Manager.updateOne(
      { _id: manager._id },
      {
        $addToSet: { assignedUserIds: entityId },
        $set: { pendingUserQuota: manager.pendingUserQuota },
      }
    );
  } else {
    await Manager.updateOne(
      { _id: manager._id },
      {
        $addToSet: { assignedSellerIds: entityId },
        $set: { pendingSellerQuota: manager.pendingSellerQuota },
      }
    );
  }

  await state.save();
  return manager._id;
};

export const assignUserToManager = async (userId) => {
  return assignEntityToManager({ entityId: userId, entityType: "user" });
};

export const assignSellerToManager = async (sellerId) => {
  return assignEntityToManager({ entityId: sellerId, entityType: "seller" });
};

export const NEW_MANAGER_DEFAULT_QUOTA = NEW_MANAGER_QUOTA;
