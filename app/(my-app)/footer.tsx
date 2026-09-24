export const Footer = () => {
    return (
        <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-4 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} My Little Shop. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
