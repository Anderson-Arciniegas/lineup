import { inject, Injectable } from '@angular/core';
import {
  SEND_BUSINESS_VERIFICATION_CODE_MUTATION,
  SEND_VERIFICATION_CODE_MUTATION,
  VERIFY_BUSINESS_VERIFICATION_CODE_MUTATION,
  VERIFY_CODE_MUTATION,
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
} from '../../models/email-verification.model';

@Injectable({
  providedIn: 'root',
})
export class BusinessEmailVerificationPrivateService {
  private apollo = inject(Apollo);

  sendBusinessVerificationCode(
    data: CreateVerificationCodeDto,
  ): Observable<BaseResponse> {
    return this.apollo
      .use('businessAPI')
      .mutate<{ sendBusinessVerificationCode: BaseResponse }>({
        mutation: SEND_BUSINESS_VERIFICATION_CODE_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.sendBusinessVerificationCode));
  }

  sendVerificationCode(
    data: SendVerificationCodeInput,
  ): Observable<BaseResponse> {
    return this.apollo
      .use('businessAPI')
      .mutate<{ sendVerificationCode: BaseResponse }>({
        mutation: SEND_VERIFICATION_CODE_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.sendVerificationCode));
  }

  verifyBusinessVerificationCode(
    data: VerifyVerificationCodeDto,
  ): Observable<BaseResponse> {
    return this.apollo
      .use('businessAPI')
      .mutate<{ verifyBusinessVerificationCode: BaseResponse }>({
        mutation: VERIFY_BUSINESS_VERIFICATION_CODE_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.verifyBusinessVerificationCode));
  }

  verifyCode(data: VerifyCodeInput): Observable<BaseResponse> {
    return this.apollo
      .use('businessAPI')
      .mutate<{ verifyCode: BaseResponse }>({
        mutation: VERIFY_CODE_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.verifyCode));
  }
}
