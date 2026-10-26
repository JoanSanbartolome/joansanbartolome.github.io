/* Textos en inglés de la sección "Otros proyectos de ingeniería". El español está en el HTML. */
site.addTranslations('en', {
  'projects.tag': 'More projects',
  'projects.title': 'Other engineering projects',
  'projects.chipsLabel': 'Technologies',
  'projects.github': 'Code on GitHub',
  'projects.new_tab': '(opens in a new tab)',

  'projects.date.2025-04': 'Apr 2025',
  'projects.date.2026-01': 'Jan 2026',
  'projects.date.2026-02': 'Feb 2026',
  'projects.date.2026-06': 'Jun 2026',
  'projects.date.2026-09': 'Sep 2026',
  'projects.date.2026-10': 'Oct 2026',

  'projects.fifo.title': 'Synchronous FIFO: RTL design and constrained-random verification',
  'projects.fifo.text':
    'Team of 2: parameterizable FIFO in RTL over dual-port RAM and a class-based testbench with driver, monitor, reference-model scoreboard and covergroups. A coverage-driven constrained-random test reaches <strong>100 % functional coverage (141/141 bins) in 2,550 cycles</strong>, vs 99.79 % for a fixed-length 10,000-cycle run, with 0 mismatches. Automated Tcl regression (6/6 configurations) and injection of 3 fault types with bind and force/release.',
  'projects.fifo.chipSv': 'SystemVerilog (OOP)',
  'projects.fifo.alt':
    'Testbench diagram: constrained-random generator, driver, FIFO under test, monitor, scoreboard with reference model and covergroups that steer stimulus generation.',
  'projects.fifo.svgGen': 'Generator',
  'projects.fifo.svgGenSub': 'constrained-random',
  'projects.fifo.svgDut': 'FIFO (DUT)',
  'projects.fifo.svgRam': 'dual-port RAM',
  'projects.fifo.svgRef': 'ref. model',
  'projects.fifo.svgSteer': 'steers',
  'projects.fifo.covTitle': 'Simulated cycles and coverage reached',
  'projects.fifo.covDriven': 'Coverage-driven',
  'projects.fifo.covDrivenValue': '2,550 cycles · 100 %',
  'projects.fifo.covFixed': 'Fixed-length run',
  'projects.fifo.covFixedValue': '10,000 cycles · 99.79 %',

  'projects.crossover.title': 'IIR crossover filter (Linkwitz-Riley LR4) on FPGA',
  'projects.crossover.text':
    'Real-time 48 kHz/24-bit audio crossover in Q4.36 fixed point, with 72-bit accumulators and a custom RTL UART at 921,600 bps. Verified <strong>bit-exact against a Python golden model</strong>; uses 12 % of registers and 8.7 % of LUTs.',
  'projects.crossover.alt':
    'Crossover frequency response: theoretical Linkwitz-Riley curves vs RTL simulation and UART capture, crossing at 2 kHz.',

  'projects.scope.title': 'Digital oscilloscope with real-time acquisition',
  'projects.scope.text':
    'Team of 5 on the DE2-115 board. I designed the acquisition path and trigger logic: <strong>continuous capture at up to 60 MHz with zero sample loss</strong> through a circular RAM/FIFO buffer.',
  'projects.scope.alt': 'Oscilloscope video frame rebuilt from simulation: two sine waves on screen.',

  'projects.soc.title': 'SoC co-design: Nios II with RTOS and custom peripherals',
  'projects.soc.text':
    'Integrated the Nios II soft-core in Platform Designer and <strong>custom Verilog peripherals on the Avalon bus</strong>. Multitasking firmware in C on a real-time operating system (RTOS).',
  'projects.soc.alt':
    'System diagram: Nios II processor with RTOS and C tasks, connected through the Avalon bus to custom Verilog peripherals.',
  'projects.soc.svgBus': 'Avalon bus',
  'projects.soc.svgPeriph': 'Custom Verilog peripherals',

  'projects.tfg.title': "Wireless drip-irrigation controller (Bachelor's thesis)",
  'projects.tfg.text':
    'Designed, fabricated and validated a 2-layer PCB: 4 optocoupler-isolated relays, 12 V to 5 V buck converter (TPS54202) and a 4–20 mA input with an RC filter (fc ≈ 5.9 Hz) added after measuring a noisy signal. ESPHome firmware with OTA updates and Home Assistant integration. <strong>Grade: 8/10.</strong>',
  'projects.tfg.alt':
    'KiCad 3D render of the irrigation controller PCB: ESP32-S2 module, four relays with terminal blocks and power stage.',
});
