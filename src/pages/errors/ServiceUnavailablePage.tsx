import React from 'react';
import ErrorPage from './ErrorPage';

const ServiceUnavailablePage: React.FC = () => <ErrorPage code={503} />;

export default ServiceUnavailablePage;
