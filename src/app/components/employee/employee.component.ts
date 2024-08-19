import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';


interface Employee {
  name: string;
  totalTimeWorked: number;
}

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  employees: Employee[] = [];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe((data: any[]) => {
      this.employees = data
        .reduce((acc: Employee[], entry) => {
          const existingEmployee = acc.find((e: Employee) => e.name === entry.EmployeeName);
          const totalTimeWorked = (new Date(entry.EndTimeUtc).getTime() - new Date(entry.StarTimeUtc).getTime()) / 3600000;

          if (existingEmployee) {
            existingEmployee.totalTimeWorked += totalTimeWorked;
          } else {
            acc.push({ name: entry.EmployeeName, totalTimeWorked });
          }

          return acc;
        }, [] as Employee[])
        .sort((a: Employee, b: Employee) => b.totalTimeWorked - a.totalTimeWorked);

      this.createPieChart();
    });
  }

  createPieChart(): void {
    const canvas = document.getElementById('employeePieChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx && this.employees.length > 0) {
      const totalHours = this.employees.reduce((sum, employee) => sum + employee.totalTimeWorked, 0);
      let startAngle = 0;

      this.employees.forEach(employee => {
        const sliceAngle = (employee.totalTimeWorked / totalHours) * 2 * Math.PI;
        const color = this.getRandomColor();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(200, 200); // Center of the pie chart
        ctx.arc(200, 200, 150, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        // Draw text labels
        const labelX = 200 + (170 * Math.cos(startAngle + sliceAngle / 2));
        const labelY = 200 + (170 * Math.sin(startAngle + sliceAngle / 2));
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(`${employee.name}: ${employee.totalTimeWorked.toFixed(2)} hrs`, labelX, labelY);

        startAngle += sliceAngle;
      });
    }
  }

  getRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }
}
