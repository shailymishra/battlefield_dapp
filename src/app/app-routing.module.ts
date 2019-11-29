import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { RegisterComponent } from "./auth/register/register.component";
import { AuthGuard } from './auth/auth.guard';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full"
  },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate : [AuthGuard]
  },
  {
    path: "game/:id",
    component: GameComponent,
    canActivate : [AuthGuard]
  },
  {
    path: "login",
    component: LoginComponent
  },
  { path: "register", component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
