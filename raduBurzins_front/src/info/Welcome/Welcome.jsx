import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-40 pointer-events-none" />

      <div className="section-shell relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center py-10 sm:py-14">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center text-center">

          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-dark-purple sm:text-5xl">
            Radu Burziņš
          </h1>

          <p className="mt-4 text-sm sm:text-base text-muted">
            ~ Vieta kur ģimene tiekas digitāli ~
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-sm sm:text-base no-underline">
              Reģistrēties
            </Link>
            <Link to="/login" className="btn-secondary px-6 py-3 text-sm sm:text-base no-underline">
              Pieslēgties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
