import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiclientService } from '@myt/services';
import { environment } from './app.config';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ApiclientService, HttpClient]
})
export class AppComponent {
  title = 'mytomorrows';

  /**
   *
   */
  constructor(private readonly service: ApiclientService) {
      
    this.service.getRandomStudies(this.clinicalTrialApiUrl).subscribe(x => console.log(x));
  }

  private get clinicalTrialApiUrl(): string {
    let clinicalTrialsUrl = `${environment.clinicalTrialBaseUrl}${environment.clinicalTrialUrlVersion}${environment.studyResource}`;
    const columns = ['NCTId','BriefTitle','OverallStatus','StartDate','CompletionDate','StudyFirstSubmitDate'];
    const filters = '&format=json&pageSize=1';
    clinicalTrialsUrl = `${clinicalTrialsUrl}?fields=${columns.join('|')}${filters}`;
    return clinicalTrialsUrl;
  }
}
