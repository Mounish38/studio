"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { Header } from '@/components/taskmaster/Header';
import { CreateTaskForm } from '@/components/taskmaster/CreateTaskForm';
import { TaskColumn } from '@/components/taskmaster/TaskColumn';
import type { Task, TaskStatus } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const LOCAL_STORAGE_KEY = 'taskmaster-tasks';

export default function TaskMasterPage() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(LOCAL_STORAGE_KEY, []);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const { toast } = useToast();

  // Derived states for columns, sorted by order
  const ongoingTasks = tasks.filter(t => t.status === 'ongoing').sort((a, b) => a.order - b.order);
  const currentTasks = tasks.filter(t => t.status === 'current').sort((a, b) => a.order - b.order);
  const completedTasks = tasks.filter(t => t.status === 'completed').sort((a, b) => a.order - b.order);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'status' | 'order'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      status: 'ongoing',
      order: ongoingTasks.length, // Add to the end of ongoing tasks
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => {
      const tasksCopy = prevTasks.filter(task => task.id !== taskId);
      // Normalize orders for each status group
      const statuses: TaskStatus[] = ['ongoing', 'current', 'completed'];
      statuses.forEach(status => {
        tasksCopy
          .filter(t => t.status === status)
          .sort((a,b) => a.order - b.order) // ensure they are sorted before re-assigning order
          .forEach((task, index) => task.order = index);
      });
      return tasksCopy;
    });
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    event.dataTransfer.setData('taskId', taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    event.preventDefault();
    setDragOverStatus(status);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverStatus(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus, targetTaskId?: string) => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData('taskId');
    if (!draggedId) return;

    setTasks(prevTasks => {
      let tasksCopy = prevTasks.map(t => ({ ...t }));
      const taskToMove = tasksCopy.find(t => t.id === draggedId);

      if (!taskToMove) return prevTasks;

      const originalStatus = taskToMove.status;
      
      // Remove task from its current position in logic
      tasksCopy = tasksCopy.filter(t => t.id !== draggedId);

      // Adjust orders in original column if task is moving out
      if (originalStatus !== targetStatus || originalStatus === targetStatus) { // Always re-evaluate original column
          tasksCopy
            .filter(t => t.status === originalStatus)
            .sort((a, b) => a.order - b.order)
            .forEach((t, index) => t.order = index);
      }
      
      // Add task to new column logic and determine its order
      taskToMove.status = targetStatus;
      const tasksInTargetCol = tasksCopy.filter(t => t.status === targetStatus).sort((a,b) => a.order - b.order);
      
      let newOrderIndex = tasksInTargetCol.length; // Default to end of column

      if (targetTaskId) {
        const dropTargetTaskIndex = tasksInTargetCol.findIndex(t => t.id === targetTaskId);
        if (dropTargetTaskIndex !== -1) {
          // Decide if to place before or after based on drop position (simplified: place before)
           newOrderIndex = dropTargetTaskIndex;
        }
      }
      
      // Insert taskToMove into tasksInTargetCol at newOrderIndex
      tasksInTargetCol.splice(newOrderIndex, 0, taskToMove);
      
      // Re-assign orders for tasksInTargetCol
      tasksInTargetCol.forEach((t, index) => t.order = index);

      // Combine back with other tasks
      const otherTasks = tasksCopy.filter(t => t.status !== targetStatus);
      const finalTasks = [...otherTasks, ...tasksInTargetCol];
      
      // Sort finalTasks to maintain some predictability, though filtering by status & order is primary
      finalTasks.sort((a,b) => {
        const statusOrder = {'ongoing': 0, 'current': 1, 'completed': 2};
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return a.order - b.order;
      });

      if (targetStatus === 'completed' && originalStatus !== 'completed') {
        toast({
          title: "Task Completed! 🎉",
          description: `"${taskToMove.title}" moved to completed. Well done!`,
        });
      }
      
      return finalTasks;
    });

    handleDragEnd(); // Reset dragging state
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" onDragEnd={handleDragEnd}>
      <Header onOpenCreateTaskDialog={() => setIsCreateTaskDialogOpen(true)} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TaskColumn
            title="Ongoing"
            status="ongoing"
            tasks={ongoingTasks}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDeleteTask={handleDeleteTask}
            draggingTaskId={draggingTaskId}
            dragOverStatus={dragOverStatus}
          />
          <TaskColumn
            title="Current"
            status="current"
            tasks={currentTasks}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDeleteTask={handleDeleteTask}
            draggingTaskId={draggingTaskId}
            dragOverStatus={dragOverStatus}
          />
          <TaskColumn
            title="Completed"
            status="completed"
            tasks={completedTasks}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDeleteTask={handleDeleteTask}
            draggingTaskId={draggingTaskId}
            dragOverStatus={dragOverStatus}
          />
        </div>
      </main>
      <CreateTaskForm
        isOpen={isCreateTaskDialogOpen}
        onOpenChange={setIsCreateTaskDialogOpen}
        onCreateTask={handleCreateTask}
      />
      <Toaster />
    </div>
  );
}
