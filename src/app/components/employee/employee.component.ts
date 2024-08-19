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
  chartData: { name: string; totalTimeWorked: number; startAngle: number; sliceAngle: number; color: string }[] = [];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe((data: any[]) => {
      this.employees = data
        .reduce((acc: Employee[], entry) => {
          const existingEmployee = acc.find(e => e.name === entry.EmployeeName);
          const totalTimeWorked = (new Date(entry.EndTimeUtc).getTime() - new Date(entry.StarTimeUtc).getTime()) / 3600000;

          if (existingEmployee) {
            existingEmployee.totalTimeWorked += totalTimeWorked;
          } else {
            acc.push({ name: entry.EmployeeName, totalTimeWorked });
          }

          return acc;
        }, [] as Employee[])
        .sort((a, b) => b.totalTimeWorked - a.totalTimeWorked);

      this.createPieChart();
    });
  }

  createPieChart(): void {
    const canvas = document.getElementById('employeePieChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const legendContainer = document.getElementById('legend');
    
    if (ctx && this.employees.length > 0) {
      const totalHours = this.employees.reduce((sum, employee) => sum + employee.totalTimeWorked, 0);
      const radius = Math.min(canvas.width, canvas.height) / 2 - 10; // Padding
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      let startAngle = 0;

      this.chartData = this.employees.map(employee => {
        const sliceAngle = (employee.totalTimeWorked / totalHours) * 2 * Math.PI;
        const color = this.getRandomColor();

        // Draw slice
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        // Draw percentage labels inside the slice
        const percentage = (employee.totalTimeWorked / totalHours * 100).toFixed(1);
        const labelRadius = radius * 0.6;
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + (labelRadius * Math.cos(labelAngle));
        const labelY = centerY + (labelRadius * Math.sin(labelAngle));

        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, labelX, labelY);

        startAngle += sliceAngle;

        return {
          name: employee.name,
          totalTimeWorked: employee.totalTimeWorked,
          startAngle,
          sliceAngle,
          color
        };
      });

      // Draw the legend
      if (legendContainer) {
        legendContainer.innerHTML = '';
        this.chartData.forEach(data => {
          const legendItem = document.createElement('div');
          legendItem.style.display = 'flex';
          legendItem.style.alignItems = 'center';

          const colorBox = document.createElement('div');
          colorBox.style.backgroundColor = data.color;
          colorBox.style.width = '20px';
          colorBox.style.height = '20px';
          colorBox.style.marginRight = '10px';

          const text = document.createElement('span');
          text.textContent = data.name;

          legendItem.appendChild(colorBox);
          legendItem.appendChild(text);

          legendContainer.appendChild(legendItem);
        });
      }
    }
  }

  getRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }
}
