import { registerBlockType } from '@wordpress/blocks';
import {
    useBlockProps,
    RichText,
    InspectorControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
} from '@wordpress/components';

import metadata from '../block.json';

registerBlockType( metadata.name, {
    edit( { attributes, setAttributes } ) {
        const blockProps = useBlockProps( {
            className: 'section section--contact',
        } );
        const { title, submitLabel, privacyUrl } = attributes;

        return (
            <>
                <InspectorControls>
                    <PanelBody title="R\u00e9glages">
                        <TextControl
                            label="URL politique de confidentialit\u00e9"
                            value={ privacyUrl }
                            onChange={ ( val ) =>
                                setAttributes( { privacyUrl: val } )
                            }
                        />
                    </PanelBody>
                </InspectorControls>

                <section { ...blockProps } aria-labelledby="bloc7-title">
                    <div className="container">
                        <div className="contact__inner">
                            <RichText
                                tagName="h2"
                                identifier="title"
                                id="bloc7-title"
                                className="display-xl"
                                value={ title }
                                onChange={ ( val ) =>
                                    setAttributes( { title: val } )
                                }
                                placeholder="Titre..."
                                allowedFormats={ [
                                    'core/bold',
                                    'core/italic',
                                    'core/text-color',
                                ] }
                            />
                            <div className="contact-form">
                                <div className="contact-form__fields">
                                    <div className="form-group">
                                        <label
                                            htmlFor="field-prenom"
                                            className="form-label"
                                        >
                                            Pr&eacute;nom
                                        </label>
                                        <input
                                            type="text"
                                            id="field-prenom"
                                            name="prenom"
                                            className="form-input"
                                            placeholder="Placeholder"
                                            disabled
                                            autoComplete="given-name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label
                                            htmlFor="field-nom"
                                            className="form-label"
                                        >
                                            Nom *
                                        </label>
                                        <input
                                            type="text"
                                            id="field-nom"
                                            name="nom"
                                            className="form-input"
                                            placeholder="Placeholder"
                                            disabled
                                            autoComplete="family-name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label
                                            htmlFor="field-email"
                                            className="form-label"
                                        >
                                            Adresse e-mail *
                                        </label>
                                        <input
                                            type="email"
                                            id="field-email"
                                            name="email"
                                            className="form-input"
                                            placeholder="Placeholder"
                                            disabled
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label
                                            htmlFor="field-tel"
                                            className="form-label"
                                        >
                                            Num&eacute;ro de t&eacute;l&eacute;phone
                                        </label>
                                        <input
                                            type="tel"
                                            id="field-tel"
                                            name="tel"
                                            className="form-input"
                                            placeholder="Placeholder"
                                            disabled
                                            autoComplete="tel"
                                        />
                                    </div>
                                    <div className="form-group form-group--full">
                                        <label
                                            htmlFor="field-sujet"
                                            className="form-label"
                                        >
                                            Sujet
                                        </label>
                                        <select
                                            id="field-sujet"
                                            name="sujet"
                                            className="form-input form-select"
                                            disabled
                                        >
                                            <option value="" disabled>
                                                - choisissez le sujet -
                                            </option>
                                            <option value="projet">
                                                Nouveau projet
                                            </option>
                                            <option value="devis">
                                                Demande de devis
                                            </option>
                                            <option value="maintenance">
                                                Maintenance
                                            </option>
                                            <option value="autre">Autre</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="contact-form__consent">
                                    <label className="form-checkbox">
                                        <input
                                            type="checkbox"
                                            name="consent"
                                            disabled
                                        />
                                        <span className="form-checkbox__mark"></span>
                                        <span className="form-checkbox__text text-small">
                                            J'accepte que mes donn&eacute;es
                                            soient utilis&eacute;es pour
                                            r&eacute;pondre &agrave; ma demande
                                            conform&eacute;ment &agrave; la{ ' ' }
                                            <a href={ privacyUrl }>
                                                politique de
                                                confidentialit&eacute;
                                            </a>
                                            .
                                        </span>
                                    </label>
                                </div>
                                <RichText
                                    tagName="button"
                                    className="btn btn--primary btn--submit"
                                    value={ submitLabel }
                                    onChange={ ( val ) =>
                                        setAttributes( { submitLabel: val } )
                                    }
                                    placeholder="Libell\u00e9 du bouton..."
                                    allowedFormats={ [] }
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </>
        );
    },

    save() {
        return null;
    },
} );
