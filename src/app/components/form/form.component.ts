import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { EnvironmentService } from '../../services/environment.service';
import { ApisService } from '../../services/apis.service';
import { Entry } from '../../models/entry';

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

  constructor(
    private envService: EnvironmentService,
    private apisService: ApisService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.faculties = this.envService.faculties;

    this.form.controls.staffId.valueChanges.subscribe((value) => {
      if (value) {
        this.form.controls.staffId.setValue(value.toUpperCase(), {
          emitEvent: false,
        });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const newEntry: Entry = {
      ticketId: '',
      reporterId: formValue.reporterId!,
      staffId: formValue.staffId!,
      faculty: formValue.faculty!,
      description: formValue.description!,
      channel: formValue.channel!,
      term: this.envService.currentTerm,
    };

    this.apisService.submitEntry(newEntry).subscribe({
      next: (response) => {
        newEntry.ticketId = this.apisService.generateTicketId();
        this.apisService.addLocalEntry(newEntry);
        this.form.reset();
        this.router.navigate(['/panel']);
      },
      error: (err) => console.error('Error submitting ticket:', err),
    });
  }
}
