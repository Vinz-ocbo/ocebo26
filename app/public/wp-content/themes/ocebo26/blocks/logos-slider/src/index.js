import { registerBlockType } from '@wordpress/blocks';
import {
    useBlockProps,
    RichText,
    InspectorControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    Button,
    TextControl,
} from '@wordpress/components';

import metadata from '../block.json';

const DEFAULT_LOGOS = [
    { src: 'chanel.svg', alt: 'Chanel' },
    { src: 'hermes.svg', alt: 'Herm\u00e8s' },
    { src: 'gucci.svg', alt: 'Gucci' },
    { src: 'clarins.svg', alt: 'Clarins' },
    { src: 'bnp.svg', alt: 'BNP Paribas' },
    { src: 'netflix.svg', alt: 'Netflix' },
    { src: 'konbini.svg', alt: 'Konbini' },
    { src: 'total.svg', alt: 'TotalEnergies' },
];

registerBlockType( metadata.name, {
    edit( { attributes, setAttributes } ) {
        const blockProps = useBlockProps( {
            className: 'section section--logos',
        } );
        const { sectionNumber, title, text, logos } = attributes;

        const useThemePath = ! logos || logos.length === 0;
        const displayLogos = useThemePath ? DEFAULT_LOGOS : logos;

        const getLogoSrc = ( logo ) => {
            if ( useThemePath ) {
                /* In the editor we can use the theme URI from wp.data if available,
                   but a simpler approach is to reference the assets path relative to the theme. */
                const themeUrl =
                    window.ocebo26EditorData?.themeUrl ||
                    '/wp-content/themes/ocebo26';
                return `${ themeUrl }/assets/img/logos/${ logo.src }`;
            }
            return logo.src;
        };

        const updateLogo = ( index, key, value ) => {
            const next = logos.map( ( logo, i ) =>
                i === index ? { ...logo, [ key ]: value } : logo
            );
            setAttributes( { logos: next } );
        };

        const addLogo = () => {
            setAttributes( {
                logos: [
                    ...( logos || [] ),
                    { src: '', alt: '' },
                ],
            } );
        };

        const removeLogo = ( index ) => {
            const next = logos.filter( ( _, i ) => i !== index );
            setAttributes( { logos: next } );
        };

        return (
            <>
                <InspectorControls>
                    <PanelBody title="R\u00e9glages section">
                        <TextControl
                            label="Num\u00e9ro de section"
                            value={ sectionNumber }
                            onChange={ ( val ) =>
                                setAttributes( { sectionNumber: val } )
                            }
                        />
                    </PanelBody>
                    <PanelBody title="Logos" initialOpen={ false }>
                        { useThemePath && (
                            <p style={ { fontStyle: 'italic', marginBottom: '12px' } }>
                                Logos par d\u00e9faut du th\u00e8me. Ajoutez un logo pour personnaliser.
                            </p>
                        ) }
                        { ( logos || [] ).map( ( logo, index ) => (
                            <PanelBody
                                key={ index }
                                title={ `Logo ${ index + 1 }` }
                                initialOpen={ false }
                            >
                                <TextControl
                                    label="URL de l'image"
                                    value={ logo.src }
                                    onChange={ ( val ) =>
                                        updateLogo( index, 'src', val )
                                    }
                                />
                                <TextControl
                                    label="Texte alternatif"
                                    value={ logo.alt }
                                    onChange={ ( val ) =>
                                        updateLogo( index, 'alt', val )
                                    }
                                />
                                <Button
                                    variant="secondary"
                                    isDestructive
                                    onClick={ () => removeLogo( index ) }
                                    style={ { marginTop: '8px' } }
                                >
                                    Supprimer ce logo
                                </Button>
                            </PanelBody>
                        ) ) }
                        <Button
                            variant="primary"
                            onClick={ addLogo }
                            style={ { marginTop: '8px' } }
                        >
                            Ajouter un logo
                        </Button>
                    </PanelBody>
                </InspectorControls>

                <section { ...blockProps } aria-labelledby="bloc5-title">
                    <div className="container container--wide">
                        <div className="section-header">
                            <span className="section-number" aria-hidden="true">
                                { sectionNumber }
                            </span>
                            <RichText
                                tagName="h2"
                                identifier="title"
                                id="bloc5-title"
                                className="display-lg"
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
                        </div>
                        <RichText
                            tagName="p"
                            className="logos__desc body-md section-body-indent"
                            value={ text }
                            onChange={ ( val ) =>
                                setAttributes( { text: val } )
                            }
                            placeholder="Description..."
                        />
                        <div
                            className="logos-slider"
                            aria-label="Logos de nos clients"
                        >
                            <div
                                className="logos-slider__track"
                                style={ {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '24px',
                                    alignItems: 'center',
                                } }
                            >
                                { displayLogos.map( ( logo, index ) => (
                                    <div
                                        key={ index }
                                        className="logos-slider__slide"
                                    >
                                        <img
                                            src={ getLogoSrc( logo ) }
                                            alt={ logo.alt }
                                            width="120"
                                            height="60"
                                            loading="lazy"
                                        />
                                    </div>
                                ) ) }
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
