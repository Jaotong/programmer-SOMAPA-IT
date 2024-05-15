import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from './services/api.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['id','action', 'firstname', 'lastname', 'gender', 'score'];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  userForm!: FormGroup;
  isEditMode: boolean = false;
  currentUserId: number | null = null;

  constructor(private formBuilder: FormBuilder, private api: ApiService) {}

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      gender: ['', Validators.required],
      score: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(0), Validators.max(100)]]
    });
    this.getAllUserForm();
  }


  addProduct() {
    if (this.userForm.valid) {
      if (this.isEditMode) {
        this.api.updateUser(this.currentUserId!, this.userForm.value).subscribe({
          next: (res) => {
            alert('Product updated successfully');
            this.userForm.reset();
            this.isEditMode = false;
            this.currentUserId = null;
            this.getAllUserForm();
          },
          error: () => {
            alert('Error while updating the product');
          }
        });
      } else {
        this.api.postUser(this.userForm.value).subscribe({
          next: (res) => {
            alert('Product added successfully');
            this.userForm.reset();
            this.getAllUserForm();
          },
          error: () => {
            alert('Error while adding the product');
          }
        });
      }
    }
  }

  removeUser() {
    this.userForm.reset();
    this.isEditMode = false;
    this.currentUserId = null;
  }

  getAllUserForm() {
    this.api.getUser().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        alert('Error while fetching the records!!');
      }
    });
  }

  editProduct(row: any) {
    this.isEditMode = true;
    this.currentUserId = row.id;
    this.userForm.patchValue(row);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getGenderTooltip(gender: string): string {
    switch (gender) {
      case 'F':
        return 'Female';
      case 'M':
        return 'Male';
      case 'U':
        return 'Unknown';
      default:
        return '';
    }
  }
}

