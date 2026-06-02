import React from 'react';
import ErrorPage from './ErrorPage';

const ForbiddenPage: React.FC = () => <ErrorPage code={403} />;

export default ForbiddenPage;
