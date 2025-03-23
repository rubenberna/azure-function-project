const STATUS_ENUM_NAMES = {
  REQUESTED: 'requested',
  PENDING_DATA_OWNERS: 'pending_data_owner_approval',
  DECLINED_BY_DATA_OWNERS: 'declined_by_data_owner',
  APPROVED_BY_DATA_OWNERS: 'approved_by_all_data_owners',
  DECLINED_BY_DPO: 'declined_by_DPO',
  APPROVED_BY_DPO: 'approved_by_DPO',
  ASSIGNED_DATA_ENGINEER: 'assigned_to_data_engineer',
  COMPLETED: 'completed',
  CANCELLED_BY_REQUESTER: 'cancelled_by_requester',
  PENDING_DPO_APPROVAL: 'pending_dpo_approval',
  CANCELLED_BY_ADMIN: 'cancelled_by_admin',
};

const SECTION_LABELS = {
  TARGET: 'Target',
  SECURITY: 'Security',
  SUMMARY: 'Summary',
  _FILTERS: 'Filters',
  ORIGIN: 'Origin',
  STATUS: 'Status',
  DPO_APPROVAL: 'DPO Approval',
  _ASSIGNED_DATA_ENGINEER: 'assigned_data_engineer',
  GENERAL_DETAILS: 'general_details',
};


const constants = {
  STATUS_ENUM_NAMES,
  SECTION_LABELS
};

export default constants;