import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProjects, getEmployeeName } from '@/lib/data'; // Assuming getProjects and getEmployeeName will be added
import { useToast } from '@/hooks/use-toast';
import { Calendar, User, CheckCircle, Hourglass, XCircle } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        console.log("Fetched projects and tasks data:", data);
        setProjects(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch projects data',
          variant: 'destructive',
        });
        console.error("Error fetching projects data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  console.log("Current projects state:", projects);

  const filterProjectsByStatus = (status) => {
    if (status === 'all') {
      return projects;
    }
    // Map task 'pending' status to 'not-started' for consistent filtering
    if (status === 'not-started') {
      return projects.filter(project => project.status === 'not-started' || project.status === 'pending');
    }
    return projects.filter(project => project.status === status);
  };

  // New ProjectCardItem component
  const ProjectCardItem = ({ project }) => {
    const [assignedEmployeeName, setAssignedEmployeeName] = useState('Unknown Employee');

    useEffect(() => {
      const fetchEmployeeName = async () => {
        if (project.assignedTo) {
          const name = await getEmployeeName(project.assignedTo);
          setAssignedEmployeeName(name);
        }
      };
      fetchEmployeeName();
    }, [project.assignedTo]);

    return (
      <Card key={project.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Due Date: {new Date(project.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <span>Assigned To: {assignedEmployeeName}</span>
          </div>
          <div className="flex items-center text-sm font-medium">
            {(project.status === 'completed') && (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            )}
            {(project.status === 'in-progress') && (
              <Hourglass className="h-4 w-4 mr-2 text-yellow-500" />
            )}
            {(project.status === 'not-started' || project.status === 'pending') && (
              <XCircle className="h-4 w-4 mr-2 text-blue-500" />
            )}
            <span className={
              (project.status === 'completed') ? 'text-green-500' :
              (project.status === 'in-progress') ? 'text-yellow-500' :
              'text-blue-500'
            }>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Projects Overview</h1>

        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Loading projects...
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="not-started">Not Started</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {console.log("Projects for 'all' tab:", filterProjectsByStatus('all'))}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                {filterProjectsByStatus('all').map(project => (
                  <ProjectCardItem key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="in-progress">
              {console.log("Projects for 'in-progress' tab:", filterProjectsByStatus('in-progress'))}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                {filterProjectsByStatus('in-progress').map(project => (
                  <ProjectCardItem key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="completed">
              {console.log("Projects for 'completed' tab:", filterProjectsByStatus('completed'))}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                {filterProjectsByStatus('completed').map(project => (
                  <ProjectCardItem key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="not-started">
              {console.log("Projects for 'not-started' tab:", filterProjectsByStatus('not-started'))}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                {filterProjectsByStatus('not-started').map(project => (
                  <ProjectCardItem key={project.id} project={project} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Projects; 