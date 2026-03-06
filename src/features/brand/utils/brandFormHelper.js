export function prepareFormData({logoBlob, ...values}) {
    const formData = new FormData();
        
    formData.append('values', JSON.stringify(values));
    
    if (logoBlob) { 
        formData.append('logo', logoBlob, 'logo.jpg');
    }
    
    return formData;
}