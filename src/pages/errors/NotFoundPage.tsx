import React from 'react';
import ErrorPage from './ErrorPage';

const NotFoundPage: React.FC = () => <ErrorPage code={404} />;

export default NotFoundPage;
