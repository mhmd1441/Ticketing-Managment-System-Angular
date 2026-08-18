import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { EnvironmentService } from '../../services/environment.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
})
export class FormComponent implements OnInit {
  faculties: string[] = [];

  form = new FormGroup({
    reporterId: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{4}0\d{4}$/),
    ]),
    staffId: new FormControl('', [
      Validators.required,
      Validators.pattern(/^E\d{8}$/),
    ]),
    faculty: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    channel: new FormControl('', Validators.required),
  });

  constructor(private envService: EnvironmentService) {}

  ngOnInit(): void {
    this.faculties = this.envService.faculties;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.value);
  }
}
