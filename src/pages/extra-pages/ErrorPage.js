import React from 'react';
import { Button, Result } from 'antd';
const ErrorPage = () => (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={<Button type="primary">Back HRMS</Button>}
  />
);
export default ErrorPage;
