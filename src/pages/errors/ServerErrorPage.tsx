import React from 'react';
import ErrorPage from './ErrorPage';

const ServerErrorPage: React.FC = () => <ErrorPage code={500} />;

export default ServerErrorPage;
