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
	ToggleControl,
} from '@wordpress/components';
import metadata from '../block.json';

const ArrowSVG = () => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path
			d="M4 12L12 4M12 4H5M12 4V11"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const ensureTwoColumns = ( cols ) => {
	const list = ( cols || [] ).slice( 0, 2 );
	while ( list.length < 2 ) {
		list.push( {
			title: '',
			imageId: 0,
			imageUrl: '',
			imageAlt: '',
			text: '',
			ctaLabel: '',
			ctaUrl: '',
		} );
	}
	return list.map( ( c ) => ( {
		title: c?.title ?? '',
		imageId: c?.imageId ?? 0,
		imageUrl: c?.imageUrl ?? '',
		imageAlt: c?.imageAlt ?? '',
		text: c?.text ?? '',
		ctaLabel: c?.ctaLabel ?? '',
		ctaUrl: c?.ctaUrl ?? '',
	} ) );
};

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { sectionNumber, title, whiteBackground } = attributes;
		const columns = ensureTwoColumns( attributes.columns );

		const sectionClasses = [ 'section', 'section--bloc2col' ];
		if ( whiteBackground ) sectionClasses.push( 'section--white' );

		const blockProps = useBlockProps( {
			className: sectionClasses.join( ' ' ),
		} );

		const numberClasses = [ 'section-number' ];
		if ( whiteBackground ) numberClasses.push( 'section-number--solid' );

		const updateColumn = ( index, field, value ) => {
			const next = columns.map( ( c, i ) =>
				i === index ? { ...c, [ field ]: value } : c
			);
			setAttributes( { columns: next } );
		};

		const setMedia = ( index, media ) => {
			const next = columns.map( ( c, i ) =>
				i === index
					? {
							...c,
							imageId: media?.id || 0,
							imageUrl: media?.url || '',
							imageAlt: c.imageAlt || media?.alt || '',
					  }
					: c
			);
			setAttributes( { columns: next } );
		};

		const clearMedia = ( index ) => {
			const next = columns.map( ( c, i ) =>
				i === index
					? { ...c, imageId: 0, imageUrl: '', imageAlt: '' }
					: c
			);
			setAttributes( { columns: next } );
		};

		return (
			<>
				<InspectorControls>
					<PanelBody title="Réglages section" initialOpen={ true }>
						<TextControl
							label="Numéro de section"
							value={ sectionNumber }
							onChange={ ( val ) =>
								setAttributes( { sectionNumber: val } )
							}
						/>
						<ToggleControl
							label="Fond blanc"
							help="Active un fond blanc (le bloc numéro passe en noir)."
							checked={ !! whiteBackground }
							onChange={ ( val ) =>
								setAttributes( { whiteBackground: val } )
							}
						/>
					</PanelBody>

					{ columns.map( ( col, index ) => (
						<PanelBody
							key={ index }
							title={ `Colonne ${ index + 1 }` }
							initialOpen={ index === 0 }
						>
							<TextControl
								label="Titre H3 (optionnel)"
								value={ col.title }
								onChange={ ( val ) =>
									updateColumn( index, 'title', val )
								}
							/>

							<MediaUploadCheck>
								<MediaUpload
									onSelect={ ( m ) => setMedia( index, m ) }
									allowedTypes={ [ 'image' ] }
									value={ col.imageId }
									render={ ( { open } ) => (
										<Button
											variant="secondary"
											onClick={ open }
											style={ {
												marginBottom: '8px',
												marginTop: '4px',
											} }
										>
											{ col.imageUrl
												? "Remplacer l'image"
												: 'Choisir une image (optionnel)' }
										</Button>
									) }
								/>
							</MediaUploadCheck>
							{ col.imageUrl && (
								<>
									<img
										src={ col.imageUrl }
										alt=""
										style={ {
											width: '100%',
											height: 'auto',
											marginBottom: '8px',
											borderRadius: '4px',
										} }
									/>
									<TextControl
										label="Texte alternatif"
										value={ col.imageAlt }
										onChange={ ( v ) =>
											updateColumn( index, 'imageAlt', v )
										}
									/>
									<Button
										variant="tertiary"
										isDestructive
										onClick={ () => clearMedia( index ) }
										style={ { marginBottom: '8px' } }
									>
										Retirer l'image
									</Button>
								</>
							) }

							<TextControl
								label="Libellé du CTA (vide = pas de bouton)"
								value={ col.ctaLabel }
								onChange={ ( val ) =>
									updateColumn( index, 'ctaLabel', val )
								}
							/>
							<TextControl
								label="URL du CTA"
								value={ col.ctaUrl }
								onChange={ ( val ) =>
									updateColumn( index, 'ctaUrl', val )
								}
								placeholder="https://..."
							/>
						</PanelBody>
					) ) }
				</InspectorControls>

				<section { ...blockProps } aria-labelledby="bloc2col-title">
					<div className="container">
						<div className="section-header">
							<RichText
								tagName="span"
								className={ numberClasses.join( ' ' ) }
								value={ sectionNumber }
								onChange={ ( val ) =>
									setAttributes( { sectionNumber: val } )
								}
								allowedFormats={ [] }
								placeholder="N°"
							/>
							<RichText
								tagName="h2"
								id="bloc2col-title"
								className="bloc2col__title display-lg"
								value={ title }
								onChange={ ( val ) =>
									setAttributes( { title: val } )
								}
								allowedFormats={ [
									'core/bold',
									'core/italic',
								] }
								placeholder="Titre de la section (italique = cyan)…"
							/>
						</div>

						<div className="bloc2col__columns">
							{ columns.map( ( col, index ) => (
								<div
									key={ index }
									className="bloc2col__column"
								>
									<RichText
										tagName="h3"
										className="bloc2col__col-title heading-md"
										value={ col.title }
										onChange={ ( val ) =>
											updateColumn( index, 'title', val )
										}
										allowedFormats={ [
											'core/bold',
											'core/italic',
										] }
										placeholder="Titre H3 (optionnel)"
									/>

									{ col.imageUrl && (
										<img
											className="bloc2col__image"
											src={ col.imageUrl }
											alt={ col.imageAlt || '' }
										/>
									) }

									<RichText
										tagName="p"
										className="bloc2col__text body-md"
										value={ col.text }
										onChange={ ( val ) =>
											updateColumn( index, 'text', val )
										}
										allowedFormats={ [
											'core/bold',
											'core/italic',
										] }
										placeholder="Texte (optionnel)"
									/>

									{ col.ctaLabel && (
										<span className="btn btn--primary bloc2col__cta">
											{ col.ctaLabel }
											<span
												className="btn__icon-right"
												aria-hidden="true"
											>
												<ArrowSVG />
											</span>
										</span>
									) }
								</div>
							) ) }
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
