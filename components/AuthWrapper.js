// src/components/AuthWrapper.js
import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import '../css/AuthWrapper.css';


const AuthWrapper = ({ session, setSession }) => {
  if (!session) {
    return (
      <div className="auth-wrapper">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
        />
      </div>
    );
  }
  return null;
};

export default AuthWrapper;
