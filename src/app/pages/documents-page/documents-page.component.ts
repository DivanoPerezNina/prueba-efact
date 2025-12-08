import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentsController } from '../../controllers/documents.controller';

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents-page.component.html',
  styleUrl: './documents-page.component.css',
  providers: [DocumentsController]
})
export class DocumentsPageComponent implements OnInit {
  protected readonly ctrl = inject(DocumentsController);

  ngOnInit(): void {
    if (this.ctrl.ensureSession()) {
      this.ctrl.loadCurrent();
    }
  }
}
