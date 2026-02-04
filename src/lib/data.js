// This is a compatibility layer to use the new API but maintain the same interface
// for the existing components in the system

import * as api from './api';

export const departments = api.departments;
export const positions = api.positions;

// Get token helper
const getToken = () => localStorage.getItem('token');

/**
 * @returns {import('./types').User | null}
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('./types').User>}
 */
export const login = async (email, password) => {
  return api.login(email, password);
};

/**
 * @param {Partial<import('./types').User>} userData
 * @param {string} password
 * @returns {Promise<import('./types').User>}
 */
export const signup = async (userData, password) => {
  return api.signup(userData, password);
};

/**
 * @returns {Promise<void>}
 */
export const logout = async () => {
  return api.logout();
};

/**
 * @returns {Promise<import('./types').Employee[]>}
 */
export const getEmployees = async () => {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const employees = await api.getEmployees(token);
  return employees.map((emp) => ({ ...emp, id: emp._id }));
};

/**
 * @param {string} id
 * @returns {Promise<import('./types').Employee | undefined>}
 */
export const getEmployee = async (id) => {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  
  try {
    // First try to get the employee directly
    const emp = await api.getEmployee(id, token);
    if (emp) {
      return { ...emp, id: emp._id };
    }

    // If that fails, try to find the employee in the list by userId
    const employees = await api.getEmployees(token);
    const employee = employees.find(e => e.userId === id);
    
    if (!employee) {
      throw new Error('No employee profile found');
    }

    return { ...employee, id: employee._id };
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
};

/**
 * @param {string} id
 * @returns {string}
 */
export const getDepartmentName = (id) => {
  return api.getDepartmentName(id);
};

/**
 * @param {string} id
 * @returns {string}
 */
export const getPositionName = (id) => {
  return api.getPositionName(id);
};

/**
 * @param {Omit<import('./types').Employee, 'id'>} employee
 * @returns {Promise<import('./types').Employee>}
 */
export const addEmployee = async (employee) => {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const newEmp = await api.addEmployee(employee, token);
  return { ...newEmp, id: newEmp._id };
};

/**
 * @param {string} id
 * @param {Partial<import('./types').Employee>} data
 * @returns {Promise<import('./types').Employee>}
 */
export const updateEmployee = async (id, data) => {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  const updated = await api.updateEmployee(id, data, token);
  return { ...updated, id: updated._id };
};

/**
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export const deleteEmployee = async (id) => {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  await api.deleteEmployee(id, token);
  return true;
};

/**
 * @param {string} employeeId
 * @returns {Promise<string>}
 */
export const getEmployeeName = async (employeeId) => {
  const employees = await getEmployees(); // Use the dynamic getEmployees function
  const employee = employees.find(emp => emp.id === employeeId);
  return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
};

/**
 * @returns {Promise<Array<import('./types').Project | import('./types').TaskMappedAsProject>>}
 */
export const getProjects = async () => {
  const token = getToken();
  if (!token) throw new Error('Authentication required');
  
  const [projectsData, tasksData] = await Promise.all([
    api.getProjects(token),
    api.getTasks(null, token) // Fetch all tasks, regardless of assigned employee
  ]);

  const mappedProjects = projectsData.map(proj => ({
    ...proj,
    id: proj._id,
    assignedTo: proj.assignedTo ? proj.assignedTo._id : null, // Ensure consistent assignedTo
    type: 'project',
  }));

  const mappedTasks = tasksData.map(task => ({
    id: task._id,
    name: task.title,
    description: task.description,
    dueDate: task.dueDate,
    status: task.status, // Task statuses are 'pending', 'in-progress', 'completed'
    assignedTo: task.assignedTo ? task.assignedTo._id : null, // Ensure consistent assignedTo
    type: 'task', // Differentiate between projects and tasks if needed later
  }));

  return [...mappedProjects, ...mappedTasks];
};

// Mock Project Data
const projects = [
  {
    id: 'proj1',
    name: 'Develop Employee Portal v2',
    description: 'Upgrade the existing employee portal with new features and improved UI.',
    dueDate: '2024-12-31',
    status: 'in-progress',
    assignedTo: 'emp1', // Assuming 'emp1' is an employee ID
  },
  {
    id: 'proj2',
    name: 'Q4 Marketing Campaign',
    description: 'Plan and execute marketing strategies for the fourth quarter.',
    dueDate: '2024-11-15',
    status: 'not-started',
    assignedTo: 'emp4',
  },
  {
    id: 'proj3',
    name: 'Annual Financial Audit',
    description: 'Conduct a comprehensive audit of company finances for the past year.',
    dueDate: '2024-10-01',
    status: 'completed',
    assignedTo: 'emp8',
  },
  {
    id: 'proj4',
    name: 'HR Policy Review',
    description: 'Review and update all company HR policies to ensure compliance.',
    dueDate: '2024-09-30',
    status: 'in-progress',
    assignedTo: 'emp6',
  },
  {
    id: 'proj5',
    name: 'Customer Feedback Analysis',
    description: 'Analyze customer feedback to identify key areas for improvement in services.',
    dueDate: '2025-01-31',
    status: 'not-started',
    assignedTo: 'emp14',
  },
]; 