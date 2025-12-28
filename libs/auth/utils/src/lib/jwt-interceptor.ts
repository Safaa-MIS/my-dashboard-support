import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

 const securedReq = req.clone({
    withCredentials: true, // HttpOnly Cookie 
    setHeaders: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  return next(securedReq);
};

