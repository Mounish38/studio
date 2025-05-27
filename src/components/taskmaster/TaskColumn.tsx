"use client";

import type React from 'react';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>, status: TaskStatus, targetTaskId?: string) => void;
  onDeleteTask: (taskId: string) => void;
  draggingTaskId: string | null;
  dragOverStatus: TaskStatus | null;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  onDeleteTask,
  draggingTaskId,
  dragOverStatus,
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDragOver(e, status);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Check if dropping on a task card or the column itself
    const targetElement = e.target as HTMLElement;
    const targetTaskCard = targetElement.closest('[data-task-id]');
    const targetTaskId = targetTaskCard?.getAttribute('data-task-id') || undefined;
    onDrop(e, status, targetTaskId);
  };
  
  return (
    <div
      className={cn(
        "flex-1 p-4 bg-secondary/50 rounded-lg shadow-inner min-h-[300px]",
        dragOverStatus === status && "ring-2 ring-accent"
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-status-column={status}
    >
      <h2 className="text-xl font-semibold mb-4 text-primary-foreground bg-primary p-2 rounded-t-md text-center">{title}</h2>
      <div className="space-y-0.5 min-h-[200px]"> {/* Reduced space-y for denser packing if needed, or use specific margins in TaskCard */}
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No tasks here yet.</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onDeleteTask={onDeleteTask}
              isDragging={draggingTaskId === task.id}
            />
          ))
        )}
        {/* Placeholder for dropping at the end of the column */}
        {tasks.length > 0 && (
           <div 
             className={cn("h-2 rounded", dragOverStatus === status ? "bg-accent/30" : "")}
             data-drop-target-end-of-column="true"
           />
        )}
      </div>
    </div>
  );
};
