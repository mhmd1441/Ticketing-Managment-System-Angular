import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
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
  categories: string[] = [];
  tags: string[] = [];

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
    category: new FormControl('', Validators.required),
    tags: new FormControl<string[]>([], Validators.required),
  });

  constructor(
    private envService: EnvironmentService,
    private apisService: ApisService,
    private router: Router,
  ) {}

  @ViewChild('tagPicker') tagPickerRef!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.showTagDropdown &&
      this.tagPickerRef &&
      !this.tagPickerRef.nativeElement.contains(event.target)
    ) {
      this.showTagDropdown = false;
    }
  }

  ngOnInit(): void {
    this.faculties = this.envService.faculties;
    this.categories = this.envService.categories;
    this.tags = this.envService.tags;

    this.form.controls.staffId.valueChanges.subscribe((value) => {
      if (value) {
        this.form.controls.staffId.setValue(value.toUpperCase(), {
          emitEvent: false,
        });
      }
    });
  }

  showTagDropdown = false;
  tagSearch = '';

  toggleTagDropdown(): void {
    this.showTagDropdown = !this.showTagDropdown;
  }

  onTagSearch(event: Event): void {
    this.tagSearch = (event.target as HTMLInputElement).value.toLowerCase();
  }

  filteredTags(): string[] {
    return this.tags.filter((t) => t.toLowerCase().includes(this.tagSearch));
  }

  isTagSelected(tag: string): boolean {
    return (this.form.controls.tags.value || []).includes(tag);
  }

  onTagToggle(tag: string): void {
    const current = this.form.controls.tags.value || [];
    if (current.includes(tag)) {
      this.form.controls.tags.setValue(current.filter((t) => t !== tag));
    } else {
      this.form.controls.tags.setValue([...current, tag]);
    }
    this.form.controls.tags.markAsTouched();
  }

  removeTag(tag: string, event: Event): void {
    event.stopPropagation();
    const current = this.form.controls.tags.value || [];
    this.form.controls.tags.setValue(current.filter((t) => t !== tag));
  }
  clearAllTags(event: Event): void {
    event.stopPropagation();
    this.form.controls.tags.setValue([]);
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
      category: formValue.category!,
      tags: formValue.tags!,
      status: 'Assigned',
      startDate: new Date().toISOString(),
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
