# Sertifikat RPL - Digital Certificate Portal

A digital certificate management system for the Software Engineering Laboratory. This application allows students to check their practicum status and download certificates for completed practicums.

## Features

- Secure login system using NPM (Student ID)
- Check practicum status (Passed/Not Passed)
- View Aslab (Lab Assistant) status
- Download digital certificates
- Modern and responsive UI
- Multiple practicum period support

## Tech Stack

- React 18
- TypeScript
- Material-UI (MUI)
- Framer Motion
- XLSX for Excel handling
- Vite

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/sertifikat-rpl.git
```

2. Install dependencies
```bash
cd sertifikat-rpl
npm install
```

3. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── assets/          # Static assets (Excel files, certificates)
├── components/      # Reusable components
├── contexts/        # React contexts (Auth)
├── pages/          # Page components
├── utils/          # Utility functions
└── App.tsx         # Main application component
```

## Security Features

- Route obfuscation
- Anti-inspection measures
- Console access prevention
- Text selection prevention
- Keyboard shortcut blocking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
