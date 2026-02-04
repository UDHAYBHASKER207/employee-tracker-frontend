import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDepartmentName, getPositionName } from '@/lib/data';
import { Mail, Phone, Edit, Trash2 } from 'lucide-react';

const EmployeeCard = ({ employee, onDelete }) => {
  const departmentName = getDepartmentName(employee.department);
  const positionName = getPositionName(employee.position);

  if (!employee.id) {
    console.error('❌ Missing employee ID:', employee);
    return null;
  }

  return (
    <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col items-center pt-6 pb-4">
          <div className="w-24 h-24 mb-4 overflow-hidden rounded-full border-4 border-white shadow-sm">
            <img 
              src={employee.image || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
          <h3 className="text-lg font-semibold">{employee.firstName} {employee.lastName}</h3>
          <span className="text-sm text-gray-500">{positionName}</span>
          <span className="mt-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {departmentName}
          </span>
        </div>
        
        <div className="px-6 pb-6 space-y-3">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700 truncate">{employee.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700">{employee.phone}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-4 flex justify-between">
        <Link to={`/admin/employees/edit/${employee.id}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-700 hover:text-primary hover:bg-primary/10"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(employee.id)}
          className="text-gray-700 hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmployeeCard; 