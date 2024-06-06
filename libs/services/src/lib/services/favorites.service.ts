import { Injectable } from "@angular/core";
import { StudyFlat } from "@myt/models";

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
    private _favoriteStudies: Array<StudyFlat> = [];

    public get favorites(): Array<StudyFlat> {
        return this._favoriteStudies;
    }

    public removeFavorite(study: StudyFlat): void {
        this._favoriteStudies = this._favoriteStudies.filter(y => y.ntcId !== study.ntcId);
    }

    public addFavorite(study: StudyFlat, maxCount = 9): boolean {
        if (this._favoriteStudies.length > maxCount || this._favoriteStudies.some(x => study.ntcId === x.ntcId)) {
            return false;
        } else {
            this._favoriteStudies.push(study);
            return true;
        }
    }
}