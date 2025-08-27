import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleDisplay'
})
export class RoleDisplayPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
