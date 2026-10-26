/*
 * Textos del hero.
 * - 'en': traducción de los textos del HTML (el español está en index.html).
 * - 'es' + 'en' de las frases de la terminal: solo existen en JS (las lee assets/js/sections/hero.js).
 */
site.addTranslations('en', {
  'hero.tag': 'Digital Design & Verification Engineer',
  'hero.hello': "Hi, I'm",
  'hero.lead':
    "Electronics engineer completing the <strong>MSc in Electronic Systems Engineering</strong> at UPV " +
    '(expected January 2027). I focus on <strong>RTL design in Verilog/SystemVerilog for FPGA</strong> ' +
    'and its verification, taking designs from specification to hardware: RTL, PCB and embedded systems.',
  'hero.cta_projects': 'View projects',
  'hero.cta_cv': 'Download CV',
  'hero.cv_href': 'assets/docs/Joan_San_Bartolome_Ferri_CV_EN.pdf',
  'hero.term_label':
    'Terminal with key facts: MSc in Electronic Systems Engineering at UPV, expected January 2027; ' +
    'goal, an internship in digital design or verification; tools, SystemVerilog, QuestaSim, FPGA and Altium; ' +
    'FIFO functional coverage, 100 % (141 of 141 bins).',
  'hero.photo_alt': 'Portrait of Joan San Bartolomé Ferri',
  'hero.badge': 'Seeking an internship',
  'hero.stat1_label': 'functional coverage verifying a synchronous FIFO (141/141 bins)',
  'hero.stat2_value': '48 kHz / 24-bit',
  'hero.stat2_label': 'real-time IIR crossover filter on FPGA, verified bit-exact',
  'hero.stat3_value': '4 layers',
  'hero.stat3_label': 'controlled-impedance PCB for an STM32F746ZG (grade 9.5/10)',
});

/* Frases de la terminal (efecto de escritura) */
site.addTranslations('es', {
  'hero.term_1': "estado = 'Máster MUISE (UPV) · fin previsto ene 2027'",
  'hero.term_2': "objetivo = 'prácticas en diseño o verificación digital'",
  'hero.term_3': "stack = ['SystemVerilog', 'QuestaSim', 'FPGA', 'Altium']",
  'hero.term_4': "cobertura_fifo = '100 % (141/141 bins)'",
});

site.addTranslations('en', {
  'hero.term_1': "status = 'MSc Electronic Systems Eng. (UPV) · expected Jan 2027'",
  'hero.term_2': "goal = 'internship in digital design or verification'",
  'hero.term_3': "stack = ['SystemVerilog', 'QuestaSim', 'FPGA', 'Altium']",
  'hero.term_4': "fifo_coverage = '100 % (141/141 bins)'",
});
