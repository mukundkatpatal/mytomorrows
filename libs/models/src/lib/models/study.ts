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
  studyFirstSubmitDate: string;
}

export interface DateStruct {
  date: string;
}

export interface StudiesResponse {
  nextPageToken: string;
  studies: Study[];
}

export interface StudyFlat {
  ntcId: string;
  startDate: Date;
  briefTitle: string;
  overallStatus: string;
  completionDate: Date;
}
