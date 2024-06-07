import { Injectable, InjectionToken } from "@angular/core";
import { StudyFlat } from "@myt/models";
import { BehaviorSubject, Observable } from "rxjs";

export interface IFavoritesService {
    get favorites$(): Observable<StudyFlat[]>;
    removeFavorite(study: StudyFlat): void;
    addFavorite(study: StudyFlat, maxCount?: number): boolean
}

export const FAVORITES_SERVICE_TOKEN = new InjectionToken<IFavoritesService>('IFavoritesService');

@Injectable({
    providedIn: 'root',
  })
export class FavoritesServiceArrayStore implements IFavoritesService {
    private readonly _favoriteStudies$ = new BehaviorSubject<StudyFlat[]>([]);

    public get favorites$(): Observable<StudyFlat[]> {
        return this._favoriteStudies$.asObservable();
    }

    public removeFavorite(study: StudyFlat): void {
        this._favoriteStudies$.next(this._favoriteStudies$.value.filter(y => y.ntcId !== study.ntcId));
    }

    public addFavorite(study: StudyFlat, maxCount = 9): boolean {
        if (this._favoriteStudies$.value.length > maxCount || this._favoriteStudies$.value.some(x => study.ntcId === x.ntcId)) {
            return false;
        } else {
            this._favoriteStudies$.next([...this._favoriteStudies$.value, { ...study, favorite: true }])
            return true;
        }
    }
}