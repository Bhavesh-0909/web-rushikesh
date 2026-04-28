export default function MapComponent() {
    return (
        <div className="w-full h-full min-h-[250px] md:min-h-[300px]">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3380.3530681072734!2d72.9533997746255!3d19.197791348138967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b90033e96335%3A0x9c38af26258f0f44!2sRushikesh%20Sutar%20and%20Associates!5e0!3m2!1sen!2sin!4v1777284955427!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    );
}