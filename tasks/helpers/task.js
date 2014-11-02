/** @module helpers/task */

module.exports = {
  /** Deduce the task configuration key from the task name */
  getTaskConfigKey: function (taskName) {
    return taskName.replace(':', '.');
  }
};
