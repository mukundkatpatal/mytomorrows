export interface Study {
  protocolSection: ProtocolSection;
}

export interface ProtocolSection {
  identificationModule: IdentificationModule;
  statusModule: StatusModule;
}

export interface IdentificationModule {
  nctId: string;
  briefTitle: string;
}

export interface StatusModule {
  overallStatus: string;
  startDateStruct: DateStruct;
  completionDateStruct: DateStruct;
  studyFirstSubmitDate: Date;
}

export interface DateStruct {
  date: Date;
}
/**
 * API level response from https://clinicaltrials.gov/api/v2/studies
 */
export interface StudiesResponse {
  nextPageToken: string;
  studies: Study[];
}
/**
 * View level interface for components.
 */
export interface StudyFlat {
  ntcId: string;
  startDate: Date;
  briefTitle: string;
  overallStatus: string;
  completionDate: Date;
  studyFirstSumbmitDate: Date;
  favorite?: boolean;
}

/**
 * UI level object representing loader state and error and state of the data
 */
export interface StudyListState {
  loading: boolean;
  error: string;
  data: StudyFlat[];
}
