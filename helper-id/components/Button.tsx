import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'black';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center text-sm md:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-2";
  
  const variants = {
    primary: "bg-brand-yellow text-brand-black hover:bg-yellow-300 border border-transparent",
    secondary: "bg-white text-brand-black hover:bg-gray-50 border border-gray-200 shadow-sm",
    outline: "bg-transparent text-brand-black border border-brand-black hover:bg-brand-black hover:text-white",
    black: "bg-brand-black text-white hover:bg-gray-800 border border-transparent",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};