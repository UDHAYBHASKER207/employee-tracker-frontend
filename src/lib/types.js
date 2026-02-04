/**
 * @typedef {Object} Employee
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} department
 * @property {string} position
 * @property {string} hireDate
 * @property {number} salary
 * @property {'active' | 'inactive'} status
 * @property {string} [image]
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {'admin' | 'employee'} role
 * @property {string} [employeeId]
 */

/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} description
 */

/**
 * @typedef {Object} Position
 * @property {string} id
 * @property {string} name
 * @property {string} department
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} dueDate // ISO Date string
 * @property {'not-started' | 'in-progress' | 'completed'} status
 * @property {string} assignedTo // Employee ID
 * @property {string} [createdBy] // User ID
 */

/**
 * @typedef {Object} AuthUserObject
 * @property {string} id
 * @property {string} email
 * @property {'admin' | 'employee'} role
 * @property {string} [name]
 */

/** @typedef {AuthUserObject | null} AuthUser */

export {} 