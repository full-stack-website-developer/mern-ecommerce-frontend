import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { prepareFormData } from "../utils/brandFormHelper";
import { brandSchema } from "../utils/brandValidation";
import { zodResolver } from "@hookform/resolvers/zod";

export const useBrandForm = (brand) => {
    const navigate = useNavigate();
    const [logoBlob, setLogoBlob] = useState(null);
    const [logoPreview, setLogoPreview] = useState(brand?.logo?.url || null);
    const formMethods = useForm({
        resolver: zodResolver(brandSchema),
        defaultValues: {
            name: brand?.name || '',
            status: brand?.status || '',
        }
    });

    const { clearErrors, setError } = formMethods;
    
    function handleLogoChange(blob, previewUrl) {
        setLogoBlob(blob);
        setLogoPreview(previewUrl);
        if (blob) {
            clearErrors('logo');
        }
    };

    function prepareSubmissionData(formValues) {
        return prepareFormData({
            ...formValues,
            logoBlob,
        })
    }
    
    function validateLogo() {
        if (!logoBlob && !brand?.logo) {
            setError('logo', {
                message: 'Logo is Required' 
            })
            return false;
        }

        return true;
    }



    return {
        logoBlob,
        logoPreview,
        handleLogoChange,
        formMethods,
        navigate,
        validateLogo,
        prepareSubmissionData
    }
}

