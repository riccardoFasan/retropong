import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayGroundComponent } from './components';

const routes: Routes = [
  {
    path: '',
    component: PlayGroundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
