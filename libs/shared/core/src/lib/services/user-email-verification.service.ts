import { inject, Injectable } from '@angular/core';
import {
  SEND_USER_VERIFICATION_CODE_MUTATION,
  SEND_VERIFICATION_CODE_USER_MUTATION,
  VERIFY_CODE_USER_MUTATION,
  VERIFY_USER_VERIFICATION_CODE_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BaseResponse,
  CreateVerificationCodeDto,
  SendVerificationCodeInput,
  VerifyCodeInput,
  VerifyVerificationCodeDto,
} from '../models/email-verification.model';

@Injectable({
  providedIn: 'root',
})
export class UserEmailVerificationService {
  private apollo = inject(Apollo);

  sendUserVerificationCode(
    data: CreateVerificationCodeDto,
  ): Observable<BaseResponse> {
    return this.apollo
      .use('userAPI')
      .mutate<{ sendUserVerificationCode: BaseResponse }>({
        mutation: SEND_USER_VERIFICATION_CODE_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.sendUserVerificationCode));
  }

  sendVerificationCode(
    data: SendVerificationCodeInput,
  ): Observable<BaseResponse> {
    return this.apollo
      .use('userAPI')
      .mutate<{ sendVerificationCode: BaseResponse }>({
        mutation: SEND_VERIFICATION_CODE_USER_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.sendVerificationCode));
  }

  verifyCode(data: VerifyCodeInput): Observable<BaseResponse> {
    return this.apollo
      .use('userAPI')
      .mutate<{ verifyCode: BaseResponse }>({
        mutation: VERIFY_CODE_USER_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.verifyCode));
  }

  verifyUserVerificationCode(
    data: VerifyVerificationCodeDto,
  ): Observable<BaseResponse> {
    return this.apollo
      .use('userAPI')
      .mutate<{ verifyUserVerificationCode: BaseResponse }>({
        mutation: VERIFY_USER_VERIFICATION_CODE_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.verifyUserVerificationCode));
  }
}
