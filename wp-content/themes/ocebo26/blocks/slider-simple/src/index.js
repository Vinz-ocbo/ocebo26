import { registerBlockType } from '@wordpress/blocks';
import {
    useBlockProps,
    RichText,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
} from '@wordpress/block-editor';
import {
    PanelBody,
    Button,
    TextControl,
    Placeholder,
} from '@wordpress/components';

import metadata from '../block.json';

registerBlockType( metadata.name, {
    edit( { attributes, setAttributes } ) {
        const blockProps = useBlockProps( {
            className: 'slider-simple-editor-wrap',
        } );
        const list = attributes.slides || [];

        const updateSlide = ( index, key, value ) => {
            const next = list.map( ( s, i ) =>
                i === index ? { ...s, [ key ]: value } : s
            );
            setAttributes( { slides: next } );
        };

        const replaceMedia = ( index, media ) => {
            const next = list.map( ( s, i ) =>
                i === index
                    ? {
                          ...s,
                          id: media.id,
                          url: media.url,
                          alt: s.alt || media.alt || '',
                      }
                    : s
            );
            setAttributes( { slides: next } );
        };

        const addSlide = ( media ) => {
            setAttributes( {
                slides: [
                    ...list,
                    {
                        id: media.id,
                        url: media.url,
                        alt: media.alt || '',
                        title: '',
                        link: '',
                    },
                ],
            } );
        };

        const removeSlide = ( index ) => {
            setAttributes( {
                slides: list.filter( ( _, i ) => i !== index ),
            } );
        };

        const moveSlide = ( index, dir ) => {
            const j = index + dir;
            if ( j < 0 || j >= list.length ) return;
            const next = [ ...list ];
            [ next[ index ], next[ j ] ] = [ next[ j ], next[ index ] ];
            setAttributes( { slides: next } );
        };

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Slides">
                        { list.length === 0 && (
                            <p style={ { fontStyle: 'italic', marginBottom: '12px' } }>
                                Aucune image. Ajoutez-en une pour commencer.
                            </p>
                        ) }
                        { list.map( ( slide, index ) => (
                            <PanelBody
                                key={ index }
                                title={ `Slide ${ index + 1 }` }
                                initialOpen={ false }
                            >
                                <MediaUploadCheck>
                                    <MediaUpload
                                        onSelect={ ( m ) => replaceMedia( index, m ) }
                                        allowedTypes={ [ 'image' ] }
                                        value={ slide.id }
                                        render={ ( { open } ) => (
                                            <Button
                                                variant="secondary"
                                                onClick={ open }
                                                style={ { marginBottom: '8px' } }
                                            >
                                                { slide.url
                                                    ? "Remplacer l'image"
                                                    : 'Choisir une image' }
                                            </Button>
                                        ) }
                                    />
                                </MediaUploadCheck>
                                { slide.url && (
                                    <img
                                        src={ slide.url }
                                        alt=""
                                        style={ {
                                            width: '100%',
                                            height: 'auto',
                                            marginBottom: '8px',
                                            borderRadius: '4px',
                                        } }
                                    />
                                ) }
                                <TextControl
                                    label="Texte alternatif"
                                    value={ slide.alt || '' }
                                    onChange={ ( v ) =>
                                        updateSlide( index, 'alt', v )
                                    }
                                />
                                <TextControl
                                    label="Titre (optionnel, H3)"
                                    value={ slide.title || '' }
                                    onChange={ ( v ) =>
                                        updateSlide( index, 'title', v )
                                    }
                                />
                                <TextControl
                                    label="URL du lien (optionnel)"
                                    value={ slide.link || '' }
                                    onChange={ ( v ) =>
                                        updateSlide( index, 'link', v )
                                    }
                                    placeholder="https://..."
                                />
                                <div
                                    style={ {
                                        display: 'flex',
                                        gap: '4px',
                                        marginTop: '12px',
                                    } }
                                >
                                    <Button
                                        variant="secondary"
                                        onClick={ () => moveSlide( index, -1 ) }
                                        disabled={ index === 0 }
                                    >
                                        ↑
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={ () => moveSlide( index, 1 ) }
                                        disabled={ index === list.length - 1 }
                                    >
                                        ↓
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        isDestructive
                                        onClick={ () => removeSlide( index ) }
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            </PanelBody>
                        ) ) }
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={ addSlide }
                                allowedTypes={ [ 'image' ] }
                                render={ ( { open } ) => (
                                    <Button
                                        variant="primary"
                                        onClick={ open }
                                        style={ { marginTop: '8px' } }
                                    >
                                        Ajouter une image
                                    </Button>
                                ) }
                            />
                        </MediaUploadCheck>
                    </PanelBody>
                </InspectorControls>

                <div { ...blockProps }>
                    { list.length === 0 ? (
                        <Placeholder
                            icon="images-alt2"
                            label="Slider — Simple"
                            instructions="Ajoutez une ou plusieurs images. Le carrousel boucle à l'infini dès qu'il y a 2 images ou plus."
                        >
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={ addSlide }
                                    allowedTypes={ [ 'image' ] }
                                    render={ ( { open } ) => (
                                        <Button variant="primary" onClick={ open }>
                                            Ajouter une image
                                        </Button>
                                    ) }
                                />
                            </MediaUploadCheck>
                        </Placeholder>
                    ) : (
                        <div className="slider-simple slider-simple--editor">
                            <div className="slider-simple__track">
                                { list.map( ( slide, index ) => (
                                    <div
                                        key={ index }
                                        className="slider-simple__slide is-center"
                                    >
                                        <div className="slider-simple__media">
                                            { slide.url && (
                                                <img
                                                    src={ slide.url }
                                                    alt={ slide.alt || '' }
                                                />
                                            ) }
                                        </div>
                                        <RichText
                                            tagName="h3"
                                            className="slider-simple__title heading-md"
                                            value={ slide.title || '' }
                                            onChange={ ( v ) =>
                                                updateSlide( index, 'title', v )
                                            }
                                            placeholder="Titre (optionnel)"
                                            allowedFormats={ [
                                                'core/bold',
                                                'core/italic',
                                            ] }
                                        />
                                    </div>
                                ) ) }
                            </div>
                        </div>
                    ) }
                </div>
            </>
        );
    },

    save() {
        return null;
    },
} );
