export interface Study {
  protocolSection: IdentificationModule;
  statusModule: StatusModule;
  hasResults: boolean;
}

export interface StatusModule {
  completionDateStruct: {
    date: Date;
  };
  overallStatus: string;
  startDateStruct: {
    date: Date;
  };
}

export interface IdentificationModule {
  ntcId: number;
  briefTitle: string;
}

export interface StudiesResponse {
  totalCount: number;
  nextPageToken: string;
  studies: Study[];
}
