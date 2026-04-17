import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  collectionData,
  query,
  where,
  QueryConstraint,
  DocumentData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private db = inject(Firestore);

  saveDocument<T extends DocumentData>(path: string, payload: T): Promise<void> {
    return setDoc(doc(this.db, path), payload, { merge: true });
  }

  async fetchDocument<T>(path: string): Promise<T | null> {
    const snap = await getDoc(doc(this.db, path));
    return snap.exists() ? (snap.data() as T) : null;
  }

  patchDocument(path: string, changes: Partial<DocumentData>): Promise<void> {
    return updateDoc(doc(this.db, path), changes);
  }

  removeDocument(path: string): Promise<void> {
    return deleteDoc(doc(this.db, path));
  }

  streamCollection<T>(path: string, ...constraints: QueryConstraint[]): Observable<T[]> {
    const ref = collection(this.db, path);
    const q = constraints.length ? query(ref, ...constraints) : ref;
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  eq(field: string, value: unknown): QueryConstraint {
    return where(field, '==', value);
  }
}
