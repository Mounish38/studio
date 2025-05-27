"use client";

import type React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Trash2 } from "lucide-react";
import { format, parseISO } from 'date-fns';
import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onDeleteTask, isDragging }) => {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={cn(
        "mb-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-grab active:cursor-grabbing",
        isDragging ? "opacity-50 ring-2 ring-primary" : "bg-card"
      )}
      data-task-id={task.id}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{task.title}</CardTitle>
        {task.description && (
          <CardDescription className="text-sm text-muted-foreground pt-1">
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="py-2">
        {task.deadline && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Deadline: {format(parseISO(task.deadline), "MMM d, yyyy")}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 pb-3 flex justify-end">
         <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)} aria-label="Delete task">
            <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
          </Button>
      </CardFooter>
    </Card>
  );
};
