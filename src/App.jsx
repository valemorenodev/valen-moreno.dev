import './App.css'
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header/Header.jsx'
import Banner from './components/Banner/Banner.jsx'
import AboutMe from './components/AboutMe/AboutMe';
import Hero from './components/Hero/Hero.jsx';
import Skills from './components/Skills/Skills.jsx';
import Proyects from './components/Projects/Projects.jsx';
import Contact from './components/Contact/Contact.jsx';
import Footer from './components/Footer/Footer.jsx';


function App() {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };
  return (
    <div className="App">
      <Header language={language} onLanguageToggle={toggleLanguage} />
      <Banner />
      <AboutMe language={language} />
      <Hero language={language} />
      <Skills language={language} />
      <Proyects language={language} />
      <Contact language={language} />
      <Footer />
    </div>
  )
}

export default App
