import { OperatorFunction, Observable } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';

// taken from https://stackblitz.com/edit/rxjs-buffer-with-debounce

export function bufferDebounceTime<T>(time: number = 0): OperatorFunction<T, T[]> {
    return (source: Observable<T>) => {
      let bufferedValues: T[] = [];

      return source.pipe(
        tap(value => bufferedValues.push(value)),
        debounceTime(time),
        map(() => bufferedValues),
        tap(() => bufferedValues = []),
      );
    };
}
