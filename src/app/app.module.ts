import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FlashMessagesModule, FlashMessagesService } from 'flash-messages-angular';
import { HttpClientModule } from '@angular/common/http';
import { ShareModule } from 'ngx-sharebuttons';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
// firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';

import { UserService } from './services/user.service';
import { ApiReliefwebService } from './services/api-reliefweb.service';
import { AboutComponent } from './components/about/about.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FilterComponent } from './components/filter/filter.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { ArticleComponent } from './components/article/article.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { LoaderComponent } from './components/loader/loader.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { DashboardState } from './components/dashboard/state/dashboard.state';
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    RegistrationComponent,
    ResetPasswordComponent,
    VerifyEmailComponent,
    AboutComponent,
    FilterComponent,
    ArticleComponent,
    SafeHtmlPipe,
    LoaderComponent,
    UserProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlashMessagesModule,
    HttpClientModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatIconModule,
    ShareModule,
    MatProgressBarModule,
    MatCardModule,
    // firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    // NGXS
    NgxsModule.forRoot([DashboardState], {
      developmentMode: !environment.production
    }),
    NgxsLoggerPluginModule.forRoot()
  ],
  providers: [
    UserService,
    ApiReliefwebService,
    FlashMessagesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
